# Automated Application Deployment Using Python
DevOps Challenge: Automated Application Deployment and Management

### Prerequisites:
- Basic understanding of GitHub Actions, Docker, and AWS EC2
- A GitHub account
- A DockerHub account
- An AWS account
- An EC2 instance running Ubuntu with Docker installed

### Step 1: Create a simple app.py application
Create a new directory for your project and navigate to it in your terminal. Create the following files with the content provided:

app.py
```
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

requirements.txt
```
Flask==3.0.0
```

### Step 2: Dockerize the application
Create a Dockerfile in your project directory with the following content:

Dockerfile
```
FROM  python:3.12.0rc1-slim-bullseye

# set a directory for the app
WORKDIR /usr/src/app

# copy all the files to the container
COPY . .

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# define the port number the container should expose
EXPOSE 5000

# run the command
CMD ["python", "./app.py"]
```

### Step 3: Define the docker-compose.yml file
Create a docker-compose.yml file in your project directory with the following content:

docker-compose.yml
```
version: '3'

services:
  app:
    image: sagargoswami2001/mywebapp:latest
    container_name: mywebapp
    restart: always
    ports:
      - "80:3000"
    environment:
      NODE_ENV: production
```

### Step 4: Create the GitHub Actions workflow
Create a new folder called .github and inside it, create another folder called workflows. In the workflows folder, create a file called ec2deploy.yaml with the following content:

ec2deploy.yaml
```
name: Build on DockerHub and Deploy to AWS
on:
  workflow_dispatch: # Allows you to run this workflow manually from the Actions tab
  push:
    branches:
      - main
env:
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
  AWS_PRIVATE_KEY: ${{ secrets.AWS_PRIVATE_KEY }}
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1
      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: ./
          push: true
          dockerfile: ./Dockerfile   # Specify the path to your Dockerfile here
          tags: sagargoswami2001/mywebapp:latest
  deploy:
    needs: build  # Specifies that the `deploy` job depends on the `build` job
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v1
      with:
        username: ${{ env.DOCKERHUB_USERNAME }}
        password: ${{ env.DOCKERHUB_TOKEN }}

    - name: Set permissions for private key
      run: |
        echo "${{ env.AWS_PRIVATE_KEY }}" > key.pem
        chmod 600 key.pem

    - name: Pull Docker image
      run: |
        ssh -o StrictHostKeyChecking=no -i key.pem ubuntu@54.165.151.230 'sudo docker pull sagargoswami2001/mywebapp:latest'

    - name: Stop running container
      run: |
        ssh -o StrictHostKeyChecking=no -i key.pem ubuntu@54.165.151.230 'sudo docker stop mywebapp || true'
        ssh -o StrictHostKeyChecking=no -i key.pem ubuntu@54.165.151.230 'sudo docker rm mywebapp || true'

    - name: Run new container
      run: |
        ssh -o StrictHostKeyChecking=no -i key.pem ubuntu@54.165.151.230 'sudo docker run -d --name mywebapp -p 80:5000 sagargoswami2001/mywebapp:latest'
```

### Step 5: Add secrets to GitHub repository
Go to the “Settings” tab of your GitHub repository, click on “Secrets” in the left sidebar, and add the following secrets:

- DOCKERHUB_USERNAME: Your DockerHub username
- DOCKERHUB_TOKEN: Your DockerHub token or password
- AWS_PRIVATE_KEY: Your AWS private key (PEM format)

![Secrets](https://github.com/sagargoswami2001/Automated-Application-Deployment-Using-Python/blob/main/Secrets.png)

To obtain these keys, follow the instructions below:

- **DOCKERHUB_USERNAME:** This is simply your DockerHub username. If you don’t have a DockerHub account yet, sign up at [DockerHub](https://hub.docker.com/signup).
- **DOCKERHUB_TOKEN:** Go into DockerHub and create an access token for your account, go to [Account Settings](https://hub.docker.com/settings/security), and click on “New Access Token”. Provide a name for the token, and click “Create”. Make sure to copy the token, as you won’t be able to see it again.
- **AWS_PRIVATE_KEY:** This is the private key associated with your EC2 instance. When you create an EC2 instance in the AWS Management Console, you are prompted to create a new key pair or use an existing one. If you’ve already created an EC2 instance, you should have downloaded the private key (with a `.pem` extension) during the instance creation process. Make sure to store this file securely, as AWS won’t provide it again.

Once you have these keys, go to the “Settings” tab of your GitHub repository, click on “Secrets” in the left sidebar, and include the keys in the secrets. This guarantees their encryption and their safe integration into the GitHub Actions process.
