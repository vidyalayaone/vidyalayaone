# Frontend Services Setup Guide

## 1. Configure Environment Variables

Each frontend app comes with a `.env.example` file that contains all the required environment variables along with detailed instructions on how to set them.  

To set up your environment, create a new file named `.env` in the app folder and copy the contents of `.env.example` into it.  

Make sure to **read the guidelines in `.env.example` carefully** to update variables.

## 2. Run the Service in Development Mode

Start the frontend app locally:

```bash
cd apps/<frontend-app-name>
pnpm dev
```
