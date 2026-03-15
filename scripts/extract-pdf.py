import PyPDF2, sys
reader = PyPDF2.PdfReader(sys.argv[1])
text = '\n'.join(page.extract_text() or '' for page in reader.pages)
sys.stdout.buffer.write(text.encode('utf-8'))
