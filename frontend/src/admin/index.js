import React from "react";
import { TinaCMS, TinaProvider } from "tinacms";
import { TinaAdmin } from "tinacms/dist/react-admin"; // lightweight admin shell
import AdminUI from "./AdminUI";

export default function AdminPage() {
  const cms = React.useMemo(
    () =>
      new TinaCMS({
        enabled: true,
        toolbar: true,
      }),
    []
  );

  return (
    <TinaProvider cms={cms}>
      <TinaAdmin>
        <AdminUI />
      </TinaAdmin>
    </TinaProvider>
  );
}

// filepath: c:\Users\PC\Desktop\IGV\igv site\igv-website-complete\frontend\src\admin\AdminUI.js
import React from "react";
import { EditLink } from "tinacms";
import PageEditorLink from "../pages/Home";

export default function AdminUI() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin - TinaCMS</h2>
      <p>
        Utilisez l'éditeur pour modifier les pages. Pour éditer la page d'accueil,
        cliquez ci‑dessous :
      </p>
      <EditLink
        to="/"
        style={{
          display: "inline-block",
          marginTop: 12,
          padding: "8px 12px",
          background: "#0ea5a4",
          color: "#fff",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Éditer la page d'accueil
      </EditLink>
    </div>
  );
}