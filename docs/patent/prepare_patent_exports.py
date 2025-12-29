
import os
import re

def simple_md_to_html(md_content, title="Patent Document"):
    """
    Converts basic Markdown to styled HTML for printing.
    No 3rd party libs required.
    """
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{title}</title>
        <style>
            body {{
                font-family: 'Times New Roman', Times, serif;
                font-size: 12pt;
                line-height: 2.0; /* USPTO prefers double spacing for Spec */
                margin: 40px;
                max-width: 800px;
            }}
            h1 {{ font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 50px; }}
            h2 {{ font-size: 14pt; font-weight: bold; margin-top: 30px; border-bottom: 1px solid #ccc; }}
            h3 {{ font-size: 12pt; font-weight: bold; font-style: italic; margin-top: 20px; }}
            p {{ margin-bottom: 15px; text-align: justify; }}
            li {{ margin-bottom: 10px; }}
            pre {{ 
                background: #fff; 
                padding: 15px; 
                border: 2px solid #000; 
                font-family: 'Courier New', monospace; 
                font-weight: bold;
                font-size: 10pt; 
                line-height: 1.2;
                white-space: pre-wrap;
            }}
            .page-break {{ page-break-before: always; }}
        </style>
    </head>
    <body>
    """
    
    lines = md_content.split('\n')
    in_code_block = False
    in_mermaid_block = False
    
    for line in lines:
        line = line.strip()
        
        # Handle Code Blocks
        if line.startswith('```'):
            if in_code_block:
                if in_mermaid_block:
                    html += "</div>\n"
                    in_mermaid_block = False
                else:
                    html += "</pre>\n"
                in_code_block = False
            else:
                if 'mermaid' in line:
                    html += '<div class="mermaid">\n'
                    in_mermaid_block = True
                else:
                    html += "<pre>\n"
                    in_mermaid_block = False
                in_code_block = True
            continue
            
        if in_code_block:
            html += line + "\n"
            continue
            
        # Headers
        if line.startswith('# '):
            html += f"<h1>{line[2:]}</h1>\n"
        elif line.startswith('## '):
            html += f"<h2>{line[3:]}</h2>\n"
        elif line.startswith('### '):
            html += f"<h3>{line[4:]}</h3>\n"
        # Lists (Bullets)
        elif line.startswith('- ') or line.startswith('* '):
            html += f"<li>{line[2:]}</li>\n"
        # Separators
        elif line.startswith('---'):
            html += "<hr>\n"
        # Standard Paragraphs
        elif line:
            # Bold formatting
            line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
            line = re.sub(r'__(.*?)__', r'<b>\1</b>', line)
            # Latex simple fix
            line = line.replace('$', '') 
            html += f"<p>{line}</p>\n"
            
    html += "</body></html>"
    return html

def convert_file(input_path, output_name):
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        html_content = simple_md_to_html(content, output_name)
        
        out_path = os.path.join(os.path.dirname(input_path), output_name)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"[OK] Converted {input_path} -> {output_name}")
        return out_path
    except Exception as e:
        print(f"[ERROR] Failed to convert {input_path}: {e}")
        return None

# Files to convert
base_dir = r"c:\Users\Kevin Inthavong\NANOSTUDIOS\math-sdk\innovative-mechanics\docs\patent"

convert_file(
    os.path.join(base_dir, "provisional_patent_application.md"), 
    "01_Specification.html"
)

convert_file(
    os.path.join(base_dir, "mechanics_diagrams.md"), 
    "02_Drawings.html"
)

convert_file(
    os.path.join(base_dir, "mathematical_proofs_appendix.md"), 
    "03_Appendix.html"
)
