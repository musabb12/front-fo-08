import type { Metadata } from "next";
import { AdminCmsClient } from "@/components/admin/AdminCmsClient";

export const metadata: Metadata = {
  title: "إدارة المحتوى",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminCmsClient />;
}
