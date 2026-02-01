using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlexiBooker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TenantProvisioningUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_menu_items_categories_CategoryId",
                table: "menu_items");

            migrationBuilder.DropPrimaryKey(
                name: "PK_categories",
                table: "categories");

            migrationBuilder.RenameTable(
                name: "categories",
                newName: "menu_categories");

            migrationBuilder.RenameIndex(
                name: "IX_categories_TenantId_Name",
                table: "menu_categories",
                newName: "IX_menu_categories_TenantId_Name");

            migrationBuilder.AddPrimaryKey(
                name: "PK_menu_categories",
                table: "menu_categories",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_menu_items_menu_categories_CategoryId",
                table: "menu_items",
                column: "CategoryId",
                principalTable: "menu_categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_menu_items_menu_categories_CategoryId",
                table: "menu_items");

            migrationBuilder.DropPrimaryKey(
                name: "PK_menu_categories",
                table: "menu_categories");

            migrationBuilder.RenameTable(
                name: "menu_categories",
                newName: "categories");

            migrationBuilder.RenameIndex(
                name: "IX_menu_categories_TenantId_Name",
                table: "categories",
                newName: "IX_categories_TenantId_Name");

            migrationBuilder.AddPrimaryKey(
                name: "PK_categories",
                table: "categories",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_menu_items_categories_CategoryId",
                table: "menu_items",
                column: "CategoryId",
                principalTable: "categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
