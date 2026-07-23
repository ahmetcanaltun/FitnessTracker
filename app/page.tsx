import { redirect } from "next/navigation";

// Kök adres her zaman ana sekmeye gider; oturum yoksa proxy /login'e çevirir.
export default function Home() {
  redirect("/exercises");
}
