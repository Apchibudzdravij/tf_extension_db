/*
  Warnings:

  - A unique constraint covering the columns `[text]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Software` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Vacancy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comment_text_key" ON "Comment"("text");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_url_key" ON "Contact"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Software_name_key" ON "Software"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vacancy_name_key" ON "Vacancy"("name");
