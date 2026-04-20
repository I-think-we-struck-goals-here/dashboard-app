import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const docsDir = path.resolve(__dirname, "..", "docs")

fs.mkdirSync(docsDir, { recursive: true })
fs.writeFileSync(path.join(docsDir, ".nojekyll"), "")
