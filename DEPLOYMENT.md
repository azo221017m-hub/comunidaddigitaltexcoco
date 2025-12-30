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

#### File Uploads Limitation

**CURRENT STATE:** The business registration form sends FormData with file uploads, but this will NOT work on Vercel without additional modifications.

**IMPORTANT:** The current file upload functionality will NOT work on Vercel by default. Vercel serverless functions have the following limitations:
- Functions are stateless (uploaded files cannot be stored on the server)
- The filesystem is read-only except for `/tmp`
- `/tmp` storage is temporary and gets cleared

**What Works Now:**
- ✅ Visit counter
- ✅ Viewing existing businesses
- ❌ Registering new businesses with images (requires implementing one of the solutions below)

**Recommended Solutions:**
1. **Vercel Blob Storage** (Recommended - easiest integration)
   - https://vercel.com/docs/storage/vercel-blob
   - Upload files directly from the frontend to Vercel Blob
   - Then save the blob URLs to MySQL

2. **Cloudinary** (Free tier available)
   - https://cloudinary.com
   - Use their upload widget in the frontend
   - Store URLs in your database

3. **AWS S3** (Enterprise solution)
   - Use presigned URLs for direct uploads from frontend
   - Store URLs in your database

For now, the API accepts image URLs. You can manually test by providing image URLs instead of uploading files.

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
