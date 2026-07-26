using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HowToDoItApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialHowToDoIt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "howtodoit");

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "howtodoit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkSequences",
                schema: "howtodoit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkSequences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkSequences_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "howtodoit",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WorkSteps",
                schema: "howtodoit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkSequenceId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkSteps_WorkSequences_WorkSequenceId",
                        column: x => x.WorkSequenceId,
                        principalSchema: "howtodoit",
                        principalTable: "WorkSequences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StepImages",
                schema: "howtodoit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkStepId = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StepImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StepImages_WorkSteps_WorkStepId",
                        column: x => x.WorkStepId,
                        principalSchema: "howtodoit",
                        principalTable: "WorkSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StepImages_WorkStepId",
                schema: "howtodoit",
                table: "StepImages",
                column: "WorkStepId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkSequences_CategoryId",
                schema: "howtodoit",
                table: "WorkSequences",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkSteps_WorkSequenceId",
                schema: "howtodoit",
                table: "WorkSteps",
                column: "WorkSequenceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StepImages",
                schema: "howtodoit");

            migrationBuilder.DropTable(
                name: "WorkSteps",
                schema: "howtodoit");

            migrationBuilder.DropTable(
                name: "WorkSequences",
                schema: "howtodoit");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "howtodoit");
        }
    }
}
