// Mermaid diagram tool for LangGraph agent
import { Tool } from "@langchain/core/tools";

export class MermaidDiagramTool extends Tool {
  constructor() {
    super();
    this.name = "mermaid_diagram";
    this.description = "Create a Mermaid diagram from code. Use this when users ask for diagrams, flowcharts, sequence diagrams, class diagrams, or any visual representation. Input should be Mermaid diagram code.";
    this.mermaidLoaded = false;
  }

  async _call(input) {
    try {
      // Validate that the input looks like Mermaid code
      const mermaidCode = input.trim();
      
      if (!mermaidCode) {
        return "Error: No Mermaid code provided. Please provide valid Mermaid diagram code.";
      }

      // Basic validation for Mermaid syntax
      const validMermaidTypes = [
        'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
        'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph'
      ];
      
      const hasValidType = validMermaidTypes.some(type => 
        mermaidCode.toLowerCase().includes(type.toLowerCase())
      );
      
      if (!hasValidType) {
        return `Error: Invalid Mermaid syntax. Please start with one of these diagram types: ${validMermaidTypes.join(', ')}`;
      }

      // Create a unique ID for the diagram
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Return HTML that includes Mermaid.js and proper rendering
      const mermaidHtml = `
        <div class="mermaid-diagram" id="${diagramId}">
          <div class="mermaid-code">
            <pre><code>${mermaidCode}</code></pre>
          </div>
          <div class="mermaid-container">
            <div class="mermaid" id="${diagramId}-render">${mermaidCode}</div>
          </div>
        </div>
        <script>
          // Load Mermaid.js if not already loaded
          if (typeof mermaid === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
            script.onload = function() {
              mermaid.initialize({ 
                startOnLoad: false,
                theme: 'default',
                themeVariables: {
                  primaryColor: '#007bff',
                  primaryTextColor: '#333',
                  primaryBorderColor: '#007bff',
                  lineColor: '#333',
                  secondaryColor: '#f8f9fa',
                  tertiaryColor: '#fff'
                }
              });
              // Render the specific diagram
              mermaid.render('${diagramId}-svg', \`${mermaidCode}\`).then(({svg}) => {
                const container = document.getElementById('${diagramId}-render');
                if (container) {
                  container.innerHTML = svg;
                }
              }).catch(err => {
                console.error('Mermaid rendering error:', err);
                const container = document.getElementById('${diagramId}-render');
                if (container) {
                  container.innerHTML = '<div class="mermaid-error">Error rendering diagram: ' + err.message + '</div>';
                }
              });
            };
            document.head.appendChild(script);
          } else {
            // Mermaid is already loaded, render immediately
            mermaid.render('${diagramId}-svg', \`${mermaidCode}\`).then(({svg}) => {
              const container = document.getElementById('${diagramId}-render');
              if (container) {
                container.innerHTML = svg;
              }
            }).catch(err => {
              console.error('Mermaid rendering error:', err);
              const container = document.getElementById('${diagramId}-render');
              if (container) {
                container.innerHTML = '<div class="mermaid-error">Error rendering diagram: ' + err.message + '</div>';
              }
            });
          }
        </script>
      `;
      console.log('MermaidDiagramTool: Mermaid HTML created successfully');
      console.log('MermaidDiagramTool: Mermaid HTML:', mermaidHtml);
      return mermaidHtml;
      
    } catch (error) {
      console.error('MermaidDiagramTool error:', error);
      return `Error creating Mermaid diagram: ${error.message}`;
    }
  }
}

