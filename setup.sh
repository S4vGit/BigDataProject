#!/bin/bash
# filepath: c:\Users\Win10\Desktop\SAVERIO UNIVERSITA'\MAGISTRALE\BIG DATA ENGINEERING\BigDataProject\setup.sh

# Install Python dependencies
pip install -r requirements.txt

# Download the spaCy transformer model
python -m spacy download en_core_web_trf