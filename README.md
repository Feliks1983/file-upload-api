# Single file upload
curl -X POST -F "file=@/path/to/file.jpg" http://localhost:3000/api/upload/single

# Multiple files upload
curl -X POST -F "files=@file1.jpg" -F "files=@file2.pdf" http://localhost:3000/api/upload/multiple

# Get uploaded file
curl http://localhost:3000/api/upload/file/filename.jpg

# List all files
curl http://localhost:3000/api/upload/files

# Delete a file
curl -X DELETE http://localhost:3000/api/upload/file/filename.jpg