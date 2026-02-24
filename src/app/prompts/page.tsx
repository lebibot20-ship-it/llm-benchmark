import { PROMPTS } from "../../benchmark/config";

export default function PromptsPage() {
  const categories = [...new Set(PROMPTS.map(p => p.category))];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <h1>📝 Test Prompts</h1>
      
      <p style={{ color: "#666", marginBottom: "40px" }}>
        These are the prompts used to benchmark the models.
        Each category tests different capabilities.
      </p>

      {categories.map(category => {
        const prompts = PROMPTS.filter(p => p.category === category);
        
        return (
          <section 
            key={category}
            style={{ 
              marginBottom: "40px",
              background: "#f5f5f5",
              padding: "30px",
              borderRadius: "10px"
            }}
          >
            <h2>{category}</h2>
            
            <div style={{ display: "grid", gap: "20px" }}>
              {prompts.map(prompt => (
                <div 
                  key={prompt.id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    borderLeft: "4px solid #333"
                  }}
                >
                  <h3>{prompt.name}</h3>
                  
                  <pre style={{ 
                    background: "#f8f8f8",
                    padding: "15px",
                    borderRadius: "5px",
                    overflow: "auto",
                    fontSize: "0.9rem",
                    maxHeight: "200px"
                  }}>
                    {prompt.prompt}
                  </pre>
                  
                  {prompt.expectedElements && (
                    <div style={{ marginTop: "15px" }}>
                      <strong>Expected elements: </strong>
                      {prompt.expectedElements.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
