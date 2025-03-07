using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class CampsiteTypeConfiguration : IEntityTypeConfiguration<CampsiteType>
{
    public void Configure(EntityTypeBuilder<CampsiteType> builder)
    {
        builder.Property(x => x.Name).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(180).IsRequired();
        builder.Property(x => x.WeekDayPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.WeekendPrice).HasColumnType("decimal(18,2)");
    }
}