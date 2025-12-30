# Comunidad Digital Texcoco - Deployment Instructions

## Deploying to Vercel

This project has been configured to work with Vercel's serverless functions. Follow these steps to deploy:

### Prerequisites
- A Vercel account (https://vercel.com)
- A MySQL database (e.g., PlanetScale, Railway, or any MySQL hosting service)

### Steps to Deploy

1. **Import the repository to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will automatically detect the `vercel.json` configuration

2. **Configure Environment Variables:**
   In the Vercel dashboard, go to Settings > Environment Variables and add the following:
   
   ```
   DB_HOST=your-database-host
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   ```

3. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your site will be available at `https://your-project.vercel.app`

### Important Notes

- **File Uploads:** The current implementation does not support file uploads in Vercel serverless functions. To enable image uploads, you need to integrate a cloud storage service like:
  - AWS S3
  - Cloudinary
  - Vercel Blob Storage
  - ImageKit

- **Database Connection:** Make sure your MySQL database is accessible from Vercel's serverless functions. Some hosting providers require you to whitelist IP addresses or use connection pooling.

- **Environment Variables:** Never commit your `.env` file. Always set environment variables through the Vercel dashboard.

### Project Structure

```
/
├── api/                    # Serverless functions
│   ├── db.js              # Database connection
│   ├── negocios.js        # Business endpoints
│   └── visitas.js         # Visits counter endpoint
├── frontend/              # Static frontend files
│   ├── index.html
│   ├── pcdtinicio.html
│   └── ...
├── backend/               # Original Express server (for local dev)
│   ├── server.js
│   └── db.js
└── vercel.json            # Vercel configuration

```

### Local Development

To run the project locally for development:

```bash
# Install backend dependencies
cd backend
npm install

# Create .env file with your database credentials
echo "DB_HOST=localhost" > .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=your-password" >> .env
echo "DB_NAME=your-database" >> .env

# Start the server
npm start
```

The backend server will run on http://localhost:3000

### Troubleshooting

**404 Errors:**
- Make sure all environment variables are set correctly in Vercel
- Check that your database is accessible from Vercel's servers
- Review the function logs in Vercel dashboard

**Database Connection Issues:**
- Verify your database credentials
- Check if your database requires SSL connections
- Ensure your database allows connections from Vercel's IP ranges

**API Not Working:**
- Check the Vercel function logs for errors
- Verify the API routes are accessible at `/api/negocios` and `/api/visitas`

## Support

For issues or questions, please open an issue in the GitHub repository.
