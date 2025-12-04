
function App() {


  return (
<div class="h-screen w-full flex flex-col">
    <header class="h-16 flex-shrink-0 bg-white border-b border-gray-200">
        <HeaderComponent />
    </header>

    <div class="flex flex-1 overflow-hidden bg-gray-50">
    
      <aside class="w-20 lg:w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
        <SidebarComponent />
      </aside>

      <main class="flex-1 overflow-y-auto p-6 lg:p-8">
        <MainContainer />
      </main>
    </div>
  </div>
  )
}

export default App