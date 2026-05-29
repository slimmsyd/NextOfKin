import { redirect } from "next/navigation";

// Generalized entry into the chapter loop. For V1 the only chapter is real
// estate, so we route straight there; when more chapters land this resolves
// to the first incomplete one. The chapter page enforces auth.
export default function YourLifeEntry() {
  redirect("/your-life/real-estate");
}
