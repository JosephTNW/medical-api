# Use a base image that includes Python in addition to Node.js
FROM nikolaik/python-nodejs:python3.10-nodejs16-alpine

# Set the working directory in the container
WORKDIR /app

# Install the necessary build tools for building Python packages with native extensions
# Including both the C and C++ compilers
RUN apk add --no-cache gcc musl-dev linux-headers g++

# Copy the package.json file and install dependencies
COPY package.json .
RUN npm install

# Install Python dependencies if you have any (optional)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the remaining source files
COPY . .

# Expose the port on which your app will run
EXPOSE 3050

# Set the command to start your Node.js application
CMD [ "npm", "start" ]