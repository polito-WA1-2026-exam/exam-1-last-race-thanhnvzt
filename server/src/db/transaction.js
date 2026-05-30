export async function withTransaction(work) {
  return await work();
}
