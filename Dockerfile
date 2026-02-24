FROM python:3.13.5

ADD app.py .

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["python", "-u", "app.py"]