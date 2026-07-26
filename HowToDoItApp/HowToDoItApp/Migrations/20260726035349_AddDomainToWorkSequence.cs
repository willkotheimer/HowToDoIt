using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HowToDoItApp.Migrations
{
    /// <inheritdoc />
    public partial class AddDomainToWorkSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Domain",
                schema: "howtodoit",
                table: "WorkSequences",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Domain",
                schema: "howtodoit",
                table: "WorkSequences");
        }
    }
}
