/*
  Warnings:

  - A unique constraint covering the columns `[order_id,course_registration_id]` on the table `order_purchased_coupon_course_registration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id,from_course_registration_id]` on the table `order_replacement_course_registration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id,to_course_registration_id]` on the table `order_replacement_course_registration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `order_purchased_coupon_course_registration_order_id_course_r_key` ON `order_purchased_coupon_course_registration`(`order_id`, `course_registration_id`);

-- CreateIndex
CREATE UNIQUE INDEX `order_replacement_course_registration_order_id_from_course_r_key` ON `order_replacement_course_registration`(`order_id`, `from_course_registration_id`);

-- CreateIndex
CREATE UNIQUE INDEX `order_replacement_course_registration_order_id_to_course_reg_key` ON `order_replacement_course_registration`(`order_id`, `to_course_registration_id`);
