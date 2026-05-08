'use client'                                   
                                                                                                     
  import { useEffect, useState } from 'react'                                                        
                                                                                                     
  export default function Home() {                                                                   
    const [health, setHealth] = useState<string>('loading...')                                       
                                                                                                     
    useEffect(() => {                                                                                
      fetch('http://localhost:8000/health')                                                          
        .then(res => res.json())                                                                     
        .then(data => setHealth(JSON.stringify(data)))                                               
        .catch(err => setHealth('Error: ' + err.message))                       
    }, [])                               
                                              
    return (                                                                                         
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">                                 
          <h1 className="text-3xl font-bold mb-4">CV-JD Matcher</h1>
          <p className="text-gray-600 mb-2">Backend health:</p>                
          <code className="block bg-gray-100 p-3 rounded text-sm">                                   
            {health}                     
          </code>                                                                                    
        </div>                                                                                       
      </main>                                                                  
    )                                                                                                
  }       