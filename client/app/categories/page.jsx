import ProductsPage from "@/app/products/page";

export default async function CategoriesPage({ searchParams }) {
  return <ProductsPage searchParams={searchParams} />;
}
