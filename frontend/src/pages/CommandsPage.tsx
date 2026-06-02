import { useEffect, useState } from 'react'
import axios from 'axios'

type Command = {
  id: number
  customer: string
  total: number

  items: {
    id: number
    quantity: number

    product: {
      name: string
      price: number
    }
  }[]
}

export function CommandsPage() {
  const [commands, setCommands] = useState<
    Command[]
  >([])

  async function loadCommands() {
    const response = await axios.get(
      'http://localhost:3333/commands'
    )

    setCommands(response.data)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCommands()
  }, [])

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold mb-6">
        Comandas
      </h2>

      <div className="grid gap-6">
        {commands.map((command) => (
          <div
            key={command.id}
            className="bg-white p-6 rounded-xl shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {command.customer}
              </h3>

              <span className="font-bold text-green-600">
                R$ {command.total}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {command.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >
                  <span>
                    {item.quantity}x{' '}
                    {item.product.name}
                  </span>

                  <span>
                    R${' '}
                    {(
                      item.product.price *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}