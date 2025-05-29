# BigDataProject
---
## 🔧 Environment Setup

### 1. (Optional) Create a Conda environment

If you use Conda, create a virtual environment:

```bash
conda create -n neo4j_env python=3.11
conda activate neo4j_env
```
### 2. Install dependencies
```
pip install -r requirements.txt
```

### 3. Configure Neo4j connection
Create a file called `.env` in the root folder with the following content:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
```
Replace your_neo4j_password with the actual password you use in Neo4j Desktop or Aura.

---
## ▶️ Run the test script
Use the following commands to test the connection and retrieve tweets for a given topic:
```
cd backend
python test_neo4j.py
```
