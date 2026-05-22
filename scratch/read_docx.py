import zipfile
import xml.etree.ElementTree as ET
import sys

# Reconfigure stdout to use UTF-8
if sys.version_info >= (3, 7):
    sys.stdout.reconfigure(encoding='utf-8')

def read_docx(file_path):
    try:
        with zipfile.ZipFile(file_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Extract paragraphs and tables if needed
            # Namespace map
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Simple text extraction: find all elements and join their text children
            paragraphs = []
            for child in root.iter():
                if child.tag.endswith('p'):
                    texts = []
                    for t in child.iter():
                        if t.tag.endswith('t') and t.text:
                            texts.append(t.text)
                    if texts:
                        paragraphs.append(''.join(texts))
                    else:
                        paragraphs.append('')
            return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading docx: {e}"

if __name__ == '__main__':
    path = r'c:\HireMe\docs\map-redesign.docx'
    print(read_docx(path))
