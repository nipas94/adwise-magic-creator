import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const business = formData.get('business') as string;
    const contentType = formData.get('contentType') as string;
    const tone = formData.get('tone') as string;
    const section = formData.get('section') as string | null; // Optional: 'captions', 'tagline', 'faqs'
    const photo = formData.get('photo') as File | null;

    console.log('Generating content for:', { business, contentType, tone, section, hasPhoto: !!photo });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt based on content type and section
    let systemPrompt = `You are an expert marketing copywriter. Generate compelling, professional content in a ${tone} tone.`;
    
    // First, analyze the photo if provided (only on initial generation, not section regeneration)
    let photoContext = '';
    if (photo && !section) {
      const photoBytes = await photo.arrayBuffer();
      const uint8Array = new Uint8Array(photoBytes);
      
      // Convert to base64 in chunks to avoid stack overflow
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const photoBase64 = btoa(binary);
      
      const photoAnalysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'user', 
              content: [
                { type: 'text', text: 'Describe what you see in this image in one short sentence (max 60 characters). Focus on the main subject or theme.' },
                { 
                  type: 'image_url', 
                  image_url: { url: `data:${photo.type};base64,${photoBase64}` }
                }
              ]
            }
          ],
          temperature: 0.7,
        }),
      });

      if (photoAnalysisResponse.ok) {
        const photoData = await photoAnalysisResponse.json();
        photoContext = photoData.choices[0].message.content.trim();
        console.log('Photo analysis:', photoContext);
      }
    }

    let userPrompt = `Business Description: ${business}\n\n`;
    
    if (photoContext) {
      userPrompt += `Photo Context: ${photoContext}\n\n`;
    }
    
    // If section is specified, only generate that section
    if (section === 'captions' || (!section && (contentType === 'all' || contentType === 'social'))) {
      userPrompt += `Generate 3 engaging social media captions (each 100-150 characters) that would work well for Instagram, Facebook, or LinkedIn.\n\n`;
    }
    
    if (section === 'tagline' || (!section && (contentType === 'all' || contentType === 'marketing'))) {
      userPrompt += `Create a memorable tagline (max 60 characters) that captures the essence of this business.\n\n`;
    }
    
    if (section === 'faqs' || (!section && (contentType === 'all' || contentType === 'faqs'))) {
      userPrompt += `Generate 2-3 frequently asked questions with clear, helpful answers.\n\n`;
    }

    userPrompt += `Return the response in the following JSON format:
{
  "captions": ["caption1", "caption2", "caption3"],
  "tagline": "your tagline here",
  "faqs": [{"q": "question", "a": "answer"}]
}

If a content type wasn't requested, return empty arrays/strings for that section.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);

    // Parse the JSON response from the AI
    let result;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: try to extract content manually
      result = {
        captions: [],
        tagline: '',
        faqs: []
      };
    }

    console.log('Parsed result:', result);

    return new Response(
      JSON.stringify({ result, photoContext: photoContext || undefined }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
