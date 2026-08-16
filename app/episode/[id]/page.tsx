import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import { config } from "@/lib/config";

async function getStreamtapeFileInfo(fileId: string) {
  try {
    const streamtapeLogin = config.streamtape.login;
    const streamtapeKey = config.streamtape.key;
    
    const res = await fetch(`${config.streamtape.apiUrl}/file/info?login=${streamtapeLogin}&key=${streamtapeKey}&file=${fileId}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const fileData = data.result?.[fileId];
    
    return fileData;
  } catch (error) {
    console.error('Error fetching Streamtape file info:', error);
    return null;
  }
}

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fileId = id;
  
  const fileData = await getStreamtapeFileInfo(fileId);
  const fileName = fileData?.name || 'Episódio';
  const fileSize = fileData?.size ? `${(fileData.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A';
  
  // Tentar extrair informações do episódio do nome do arquivo
  let episodeNumber = 1;
  let seasonNumber = 1;
  const match = fileName.match(/(\d+)x(\d+)/i);
  if (match) {
    seasonNumber = parseInt(match[1]);
    episodeNumber = parseInt(match[2]);
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <header className="sticky top-0 z-50 bg-zinc-900/30 backdrop-blur-md border-b border-zinc-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold text-lg">CJCCHUB</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-zinc-300 hover:text-white transition-colors">Início</Link>
              <Link href="/series" className="text-zinc-300 hover:text-white transition-colors">Séries</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link 
              href="/series" 
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Séries
            </Link>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {fileName}
            </h1>
            <div className="flex items-center gap-4 text-zinc-400">
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                Episódio {seasonNumber}x{episodeNumber.toString().padStart(2, '0')}
              </span>
              <span>Tamanho: {fileSize}</span>
            </div>
          </div>
          
          <div className="bg-zinc-800 rounded-xl overflow-hidden">
            <VideoPlayer fileId={fileId} isModal={false} />
          </div>
          
          <div className="mt-8 bg-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Informações do Episódio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-zinc-400 text-sm mb-1">Nome do Arquivo</h3>
                <p className="text-white font-medium">{fileName}</p>
              </div>
              <div>
                <h3 className="text-zinc-400 text-sm mb-1">Tamanho</h3>
                <p className="text-white font-medium">{fileSize}</p>
              </div>
              <div>
                <h3 className="text-zinc-400 text-sm mb-1">Temporada</h3>
                <p className="text-white font-medium">{seasonNumber}</p>
              </div>
              <div>
                <h3 className="text-zinc-400 text-sm mb-1">Episódio</h3>
                <p className="text-white font-medium">{episodeNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold text-lg">CJCCHUB</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Sua plataforma de streaming favorita
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Navegação</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-zinc-400 hover:text-white text-sm transition-colors">Início</Link></li>
                <li><Link href="/series" className="text-zinc-400 hover:text-white text-sm transition-colors">Séries</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Ajuda</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">FAQ</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Suporte</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Termos</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
            <p className="text-zinc-400 text-sm">
              © 2024 CJCCHUB. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}