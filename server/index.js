import app from './src/app.js';
import { PORT } from './src/config/constants.js';

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
