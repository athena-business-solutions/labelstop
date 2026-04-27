# Shopify Admin Dashboard Clone

React 18 admin dashboard scaffolded for a Shopify-style backend integration.

## Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `.env` and update:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_STORE_NAME=Label Stop
```

`REACT_APP_API_BASE_URL` is used by `src/services/api.js` for every Axios request.
`REACT_APP_STORE_NAME` controls the store name in the sidebar.

## API Response Format

List endpoints should return:

```json
{
  "data": [],
  "pagination": {
    "total": 248,
    "page": 1,
    "limit": 20,
    "totalPages": 13
  }
}
```

Detail endpoints should return:

```json
{
  "data": {}
}
```

## Backend Connection

Set `REACT_APP_API_BASE_URL` to your backend URL. The app already calls the requested dashboard, orders, products, customers, and analytics endpoints through `src/services/api.js`.
