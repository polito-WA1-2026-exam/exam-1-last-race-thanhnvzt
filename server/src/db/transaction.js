export async function withTransaction(db, work) {
  if (!db) return await work();

  await db.run('BEGIN');
  try {
    const result = await work();
    await db.run('COMMIT');
    return result;
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}
