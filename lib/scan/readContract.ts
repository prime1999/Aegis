export async function fetchContractInfo(txTo: string) {
  const res = await fetch("/api/scanInfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txTo }),
  });
  const data = await res.json().catch(() => null);
  console.log("scanInfo:", data);
  return data;
}

export default fetchContractInfo;
