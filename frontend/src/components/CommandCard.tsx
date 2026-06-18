import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

type Command = {
  id: number;
  customer: string;
  total: number;
  closed: boolean;
  createdAt?: string;
  openedBy?: { id: number; name: string } | null;
  closedBy?: { id: number; name: string } | null;
};

type Props = {
  command: Command;
  onUpdated: () => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return "agora";
  if (diff < 60) return `há ${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `há ${h}h ${m}min` : `há ${h}h`;
}

// ─── QR Modal ────────────────────────────────────────────────────────
type QRModalProps = {
  command: Command;
  onClose: () => void;
};

function QRModal({ command, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commandUrl = `${window.location.origin}/commands/${command.id}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, commandUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#111827", light: "#ffffff" },
    });
  }, [commandUrl]);

  function handlePrint() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>QR Comanda #${command.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              gap: 12px;
              padding: 24px;
            }
            img { width: 200px; height: 200px; }
            h1 { font-size: 18px; font-weight: 700; }
            p  { font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>${command.customer}</h1>
          <p>Comanda #${command.id}</p>
          <img src="${dataUrl}" />
          <p>${commandUrl}</p>
          <script>window.onload = () => { window.print(); window.close() }<\\/script>
        </body>
      </html>
    `);
    win.document.close();
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdrop}
      className="
        fixed inset-0 z-50
        bg-black/40 backdrop-blur-sm
        flex items-center justify-center p-4
      "
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs flex flex-col items-center gap-4 shadow-xl">
        <div className="w-full flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {command.customer}
            </h3>
            <p className="text-xs text-gray-400">Comanda #{command.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <canvas ref={canvasRef} />
        </div>

        <p className="text-xs text-gray-400 text-center break-all">
          {commandUrl}
        </p>

        <div className="flex gap-2 w-full">
          <button
            onClick={onClose}
            className="
              flex-1 px-4 py-2.5 rounded-xl border border-gray-200
              text-sm text-gray-600 hover:bg-gray-50 transition
            "
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="
              flex-1 px-4 py-2.5 rounded-xl
              bg-gray-900 hover:bg-gray-800 active:bg-black
              text-white text-sm font-medium transition
            "
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Command Card ────────────────────────────────────────────────────
export function CommandCard({ command, onUpdated }: Props) {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const { hasRole } = useAuth();

  async function handleCloseCommand(e: React.MouseEvent) {
    e.stopPropagation();
    await api.put(`/commands/${command.id}/close`);
    onUpdated();
  }

  function handleQR(e: React.MouseEvent) {
    e.stopPropagation();
    setShowQR(true);
  }

  return (
    <>
      <div
        onClick={() => navigate(`/commands/${command.id}`)}
        className="
          bg-white border border-gray-100 rounded-2xl p-5
          flex flex-col gap-3
          cursor-pointer hover:shadow-md hover:border-gray-200
          transition-all duration-150
        "
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
              {command.customer}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Comanda #{command.id}
              {command.openedBy && ` · aberta por ${command.openedBy.name}`}
            </p>
            {command.closed && command.closedBy && (
              <p className="text-xs text-gray-400">
                fechada por {command.closedBy.name}
              </p>
            )}
          </div>

          <span
            className={`
              shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg
              ${
                command.closed
                  ? "bg-gray-100 text-gray-500"
                  : "bg-green-50 text-green-700"
              }
            `}
          >
            {command.closed ? "Fechada" : "Aberta"}
          </span>
        </div>

        <div className="border-t border-gray-50" />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Total</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(command.total)}
          </span>
        </div>

        {command.createdAt && !command.closed && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            🕐 Aberta {timeAgo(command.createdAt)}
          </p>
        )}

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleQR}
            className="
              flex-1 px-4 py-2.5 rounded-xl border border-gray-200
              text-sm text-gray-600 hover:bg-gray-50
              transition-colors duration-150
            "
          >
            QR Code
          </button>

          {!command.closed && hasRole("MINIMERCADO") && (
            <button
              onClick={handleCloseCommand}
              className="
                flex-1
                bg-red-600 hover:bg-red-700 active:bg-red-800
                text-white text-sm font-medium
                px-4 py-2.5 rounded-xl
                transition-colors duration-150
              "
            >
              Fechar
            </button>
          )}
        </div>

        {command.closed && (
          <p className="text-xs text-center text-gray-300">
            Clique para ver detalhes
          </p>
        )}
      </div>

      {showQR && <QRModal command={command} onClose={() => setShowQR(false)} />}
    </>
  );
}
