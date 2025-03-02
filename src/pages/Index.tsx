
import { useEffect, useState } from "react";

const Index = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div 
        className={`transition-all duration-1000 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          <h1 className="text-5xl font-light tracking-tight text-gray-900">
            Hello, World.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Index;
