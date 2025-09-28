import React from "react";
import { Link } from "react-router-dom";

export default function AppHeader() {
  return (
    <header className="bg-sky-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="JBR FRIOS"
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold tracking-wide">
            JBR FRIOS
          </span>
        </Link>

        <nav className="flex gap-6">
          <Link to="/products" className="hover:underline">
            Produtos
          </Link>
          <Link to="/customers" className="hover:underline">
            Clientes
          </Link>
          <Link to="/suppliers" className="hover:underline">
            Fornecedores
          </Link>
          <Link to="/financial" className="hover:underline">
            Financeiro
          </Link>
        </nav>
      </div>
    </header>
  );
}
