import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { Nav } from "@/components/Nav";
import { OrderForm } from "@/components/OrderForm";
import { OrderList } from "@/components/OrderList";
import { Summary } from "@/components/Summary";
import { listExpenses, listOrders, summarize } from "@/lib/orders";

export default async function Home() {
  const [orders, expenses] = await Promise.all([listOrders("today"), listExpenses("today")]);
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-10">
      <Nav />
      <Summary s={summarize(orders, expenses)} title="Today" />
      <OrderForm />
      <ExpenseForm />
      <section>
        <h2 className="mb-1 text-sm font-semibold text-zinc-500">Today's orders</h2>
        <OrderList orders={orders} />
      </section>
      {expenses.length > 0 && (
        <section>
          <h2 className="mb-1 text-sm font-semibold text-zinc-500">Today's expenses</h2>
          <ExpenseList expenses={expenses} />
        </section>
      )}
    </main>
  );
}
