from flask import Flask
from flask import request
from flask import session
from flask import jsonify
from sqlalchemy import event
from flask_session import Session
from flask_cors import CORS
from sqlalchemy.engine import Engine
import os
from dotenv import load_dotenv
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

model = OllamaLLM(model='llama3.2', base_url=os.getenv("OLLAMA_HOST"))
embeddings = OllamaEmbeddings(model="mxbai-embed-large", base_url=os.getenv("OLLAMA_HOST"))
db_location = "./chrome_langchain_db"

def create_app():
	load_dotenv()

	app = Flask(__name__)
	CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://127.0.0.1:3000", "http://localhost:3000"]}})
	
	app.config['SECRET_KEY']=os.getenv("SECRET_KEY")
	app.config['SESSION_TYPE'] = 'filesystem'

	Session(app)

	@app.before_request
	def log_request():
		print("Incoming:", request.method, request.path)

	# User enters text from a video transcript
	@app.route('/input',  methods=['GET', 'POST'])
	def input():
		try:
			if(request.method == 'POST'):
				data = request.get_json()
				input = data.get('input',None)
				session["history"] = []

				# removes the old video transcript and adds the new one into the vector database
				vector_store = Chroma(
					collection_name="transcript",
					persist_directory=db_location,
					embedding_function=embeddings
				)
				vector_store.delete(ids=["transcript_1"])
				doc = Document(page_content=input)
				vector_store.add_documents(documents=[doc], ids=["transcript_1"])
				return {'status':'ok'}
		except Exception as e:
			print('error:', e)
			return {'status':'error','message':'Something went wrong.'}

	# User asks the AI questions
	@app.route('/conversation',  methods=['GET', 'POST'])
	def conversation():
		data = request.get_json()
		question = data.get('question',None)
		try:
			if(request.method == 'POST'):
				template = """

				Role:  
				You are an expert assistant that answers questions strictly based on the content of a provided video transcript.

				Task:  
				When the user asks a question, respond using only the information found in the transcript.

				If the answer is explicitly stated, provide a clear, direct response.

				If the transcript implies the answer, explain the reasoning briefly.

				If the transcript does not contain enough information, say so plainly rather than guessing.

				Do not invent details, speculate, or add outside knowledge unless the user explicitly requests external context.

				Behavior Guidelines:

				Keep answers concise but complete.

				When helpful, quote short relevant lines from the transcript (no more than one or two sentences).

				If the transcript is messy or unstructured, interpret it carefully and reconstruct meaning without altering facts.

				If the user asks for a summary, clarification, or explanation, provide it using only transcript content.

				Transcript:  
				{input}

				Conversation so far:
				{history}

				User Question:
				{question}

				"""
				prompt = ChatPromptTemplate.from_template(template)
				chain = prompt | model
				vector_store = Chroma(
					collection_name="transcript",
					persist_directory=db_location,
					embedding_function=embeddings
				)
				retriever = vector_store.as_retriever(
					search_kwargs={"k": 5}
				)
				input = retriever.invoke(question)
				result = chain.invoke({"input": input, "history": session["history"], "question": question})
				return {'status':'ok', 'result': result}
		except Exception as e:
			print('error:', e)
			return {'status':'error','message':'Something went wrong.'}
	
	return app

if __name__ == "__main__":
	app = create_app()
	app.run(host="0.0.0.0", port=5000, debug=True)