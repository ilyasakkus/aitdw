import dynamic from 'next/dynamic';

const XMLEditor = dynamic(() => import('@/components/Editor/XMLEditor'), {
  ssr: false
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">S1000D Technical Writer</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4">XML Editor</h2>
            <XMLEditor />
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4">Preview</h2>
            {/* Preview component will be added here */}
          </div>
        </div>
      </div>
    </main>
  );
}
