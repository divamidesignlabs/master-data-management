
# master-data-management-react

A reusable **React library** for managing master data using **metadata-driven forms and tables**.  
It automatically generates grids and forms while letting you fully control **APIs, routing, and authentication**.

---

## ✨ Features

- 📊 **Server-side data grid**
  - Pagination
  - Filters
  - Multi-column sorting
- 📝 **Auto-generated forms**
  - Create / View / Edit
- 🔄 **Full CRUD support**
- 📤 **CSV & Excel export**
- 🎯 **Metadata-driven UI** (no hardcoded fields)
- 🎨 **Material-UI based components**
- 🧩 **Works with any backend and routing setup**

---

## 📦 Installation

```bash
npm install master-data-management-react
````

---

## 📚 Peer Dependencies

```bash
npm install react react-dom react-router-dom axios \
@mui/material @emotion/react @emotion/styled \
ag-grid-react ag-grid-community
```

---

## 🚀 Quick Start

**⚠️ IMPORTANT:** Configure your axios instance with a `baseURL` to ensure dropdown options and all API calls go to your backend API, not your frontend. See [CLIENT_AXIOS_SETUP.md](./CLIENT_AXIOS_SETUP.md) for detailed setup.

```tsx
import { MasterView } from "master-data-management-react";
import axios from "axios";

// ✅ CRITICAL: Configure axios with baseURL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});
const apiClient = axios.create({
  baseURL: "https://api.example.com",
});

const apiEndpoints = {
  entities: "/master/entities",
  metadata: (entity) => `/master/${entity}/metadata`,
  records: (entity) => `/master/${entity}/records`,
  recordById: (entity, id) => `/master/${entity}/records/${id}`,
  exportCSV: (entity) => `/master/${entity}/export/csv`,
  exportExcel: (entity) => `/master/${entity}/export/excel`,
};

export default function App() {
  return (
    <MasterView
      apiClient={apiClient}
      apiEndpoints={apiEndpoints}
    />
  );
}
```

**⚠️ Important:** Your `apiClient` **must** have a `baseURL` configured. Without it, API calls will try to fetch from the frontend itself instead of your backend.

> 📖 **Need help with axios setup?** See [AXIOS_SETUP_GUIDE.md](./AXIOS_SETUP_GUIDE.md) for detailed instructions, including:
> - Configuring axios with interceptors (JWT auth)
> - Environment variables setup
> - Monorepo considerations
> - Troubleshooting common issues

---

## 📝 Forms (Create / View / Edit)

```tsx
import { MasterForm } from "master-data-management-react";
import { FORM_MODES } from "master-data-management-react/constants";

<MasterForm
  apiClient={apiClient}
  apiEndpoints={apiEndpoints}
  entity="country"
  id="10"
  mode={FORM_MODES.EDIT}
  onBack={() => navigate("/master")}
  onSuccess={() => navigate("/master")}
/>;
```

---

## 🧭 Routing (Example)

This package **does not enforce routing**.
You define routes however your application prefers.

```tsx
<Route path="master" element={<MasterView />} />
<Route path="master/:entity/new" element={<MasterForm />} />
<Route path="master/:entity/:id" element={<MasterForm />} />
<Route path="master/:entity/:id/edit" element={<MasterForm />} />
```

---

## 🎨 Styling

Import styles **once** in your app entry file:

```ts
import "master-data-management-react/dist/style.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
```

---

## 🔗 Backend API Contract

Your backend must expose the following endpoints:

| Endpoint                       | Method |
| ------------------------------ | ------ |
| `/master/entities`             | GET    |
| `/master/:entity/metadata`     | GET    |
| `/master/:entity/records`      | GET    |
| `/master/:entity/records/:id`  | GET    |
| `/master/:entity/records`      | POST   |
| `/master/:entity/records/:id`  | PUT    |
| `/master/:entity/export/csv`   | GET    |
| `/master/:entity/export/excel` | GET    |

---

## 🧩 Metadata Example

```json
{
  "parameterList": [
    { "name": "countryName", "label": "Country", "dataType": "string" }
  ],
  "resultsList": [
    { "name": "countryName", "label": "Country Name" }
  ],
  "formConfig": {
    "Country Name": {
      "fieldName": "countryName",
      "fieldType": "input",
      "validation": { "required": true }
    }
  }
}
```

---

## ⚙️ Customization

You can customize:

* ✅ API URLs
* ✅ Axios instance (auth, interceptors, refresh tokens)
* ✅ Routing & navigation
* ✅ Permissions / guards
* ✅ Styling & MUI theme
* ✅ Backend metadata behavior

---

## ❌ What This Package Does NOT Do

* ❌ Force routing
* ❌ Handle authentication
* ❌ Assume backend structure

---

## 🧠 How It Works (Simple)

1. Backend sends metadata
2. Grid & forms render automatically
3. CRUD, sorting, filtering handled internally
4. You control navigation and APIs
5. If wanted auto routes then use backend package master-data-management (npm i master-data-management) works for nestjs typeorm

---

## 📄 License

**MIT License**
