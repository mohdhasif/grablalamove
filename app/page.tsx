import { Nav } from "@/components/Nav";
import { OrderForm } from "@/components/OrderForm";
import { OrderList } from "@/components/OrderList";
import { Summary } from "@/components/Summary";
import { listOrders, summarize } from "@/lib/orders";

export default async function Home() {
  const orders = await listOrders("today");
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-10">
      <Nav />
      <Summary s={summarize(orders)} title="Hari ini" />
      <OrderForm />
      <section>
        <h2 className="mb-1 text-sm font-semibold text-zinc-500">Order hari ini</h2>
        <OrderList orders={orders} />
      </section>
    </main>
  );
}
