export async function GET(){return Response.json({connected:!!process.env.OPENAI_API_KEY},{headers:{'Cache-Control':'no-store'}});}
