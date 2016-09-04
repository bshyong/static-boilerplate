# Static website boilerplate with BassCSS

### Building
- `npm install`
- `gulp`

### Deploying
- Make a proper `favicon.ico` and `apple-touch-icon.png`
- Set up your S3 bucket
- Set up IAM user with access to upload to S3 bucket
- Set up `aws.json` with proper credentials. Look at `aws.json.example` for reference
- `gulp deploy`
