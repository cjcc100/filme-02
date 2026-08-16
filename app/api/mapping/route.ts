import { config } from '@/lib/config';

export async function GET() {
  try {
    // Buscar arquivos do Streamtape
    const streamtapeLogin = config.streamtape.login;
    const streamtapeKey = config.streamtape.key;
    
    const streamtapeRes = await fetch(`${config.streamtape.apiUrl}/file/listfolder?login=${streamtapeLogin}&key=${streamtapeKey}&folder=`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!streamtapeRes.ok) {
      throw new Error('Failed to fetch Streamtape files');
    }

    const streamtapeData = await streamtapeRes.json();
    
    if (streamtapeData.status !== 200 || !streamtapeData.result?.files) {
      throw new Error('Invalid Streamtape response');
    }
    
    const files = streamtapeData.result.files || [];

    // Função melhorada para limpar nome do arquivo com remoção de acentos
    function cleanFileName(filename: string): string {
      return filename
        .replace(/\.[^/.]+$/, '') // Remover extensão
        .replace(/\d{4}/g, '') // Remover anos de 4 dígitos
        .replace(/\[.*?\]/g, '') // Remover conteúdo entre colchetes
        .replace(/\(.*?\)/g, '') // Remover conteúdo entre parênteses
        .replace(/[._-]/g, ' ') // Substituir separadores por espaço
        .replace(/\s+/g, ' ') // Remover espaços extras
        .normalize('NFD') // Normalizar caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .trim()
        .toLowerCase();
    }

    // Buscar no TMDb para cada arquivo
    const tmdbApiKey = config.tmdb.apiKey;
    const mapping: Record<string, string> = {};

    for (const file of files) {
      const fileName = file.name || '';
      if (!fileName) continue;

      const cleanName = cleanFileName(fileName);
      if (cleanName.length < 3) continue;

      try {
        // Buscar no TMDb
        const searchRes = await fetch(
          `${config.tmdb.baseUrl}/search/movie?api_key=${tmdbApiKey}&language=pt-BR&query=${encodeURIComponent(cleanName)}`
        );

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
            const tmdbId = searchData.results[0].id.toString();
            mapping[tmdbId] = file.linkid;
            console.log(`Mapped: ${fileName} -> TMDb ID: ${tmdbId}, Streamtape File ID: ${file.linkid}`);
          }
        }
      } catch (error) {
        console.error(`Error searching TMDb for ${fileName}:`, error);
      }
    }

    return Response.json({ mapping });
  } catch (error) {
    console.error('Error creating mapping:', error);
    return Response.json({ error: 'Failed to create mapping' }, { status: 500 });
  }
}