-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "clave" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "fecha_de_inicio" DATETIME NOT NULL,
    "estado" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "created_by" INTEGER NOT NULL,
    CONSTRAINT "Proyecto_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");
