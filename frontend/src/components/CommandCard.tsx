
import { api } from "../services/api"

type Command = {
    id: number
    customer: string
    total: number
    closed: boolean
}

type Props = {
    command: Command
    onSelect: () => void
    onUpdated: () => void
}

export function CommandCard({
    command,
    onSelect,
    onUpdated,
}:Props){

async function handleCloseCommand() {
    await api.put(
        `/commands/${command.id}/close`
    )
    onUpdated()
}

    return (
        <div 
        onClick={onSelect}
        className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-2xl font-bold">
                {command.customer}
            </h2>

             <span
                className={`
                px-3 py-1 rounded-full text-sm font-bold
                ${
                    command.closed
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }
                `}
            >
                {command.closed ? 'Fechada' : 'Aberta'}
            </span>

            <p className="text-gray-500">
                Comanda #{command.id}
            </p>

            <p>
                R$ {command.total}
            </p>

            {
            !command.closed && (
                <button
                onClick={handleCloseCommand}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl cursor-pointer"
                >
                Fechar Comanda
                </button>
            )
}
        </div>
    )
}
