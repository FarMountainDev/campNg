using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class CampsiteConfiguration : IEntityTypeConfiguration<Campsite>
{
    public void Configure(EntityTypeBuilder<Campsite> builder)
    {
        builder.Property(x => x.Name).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(180).IsRequired();
    }
}