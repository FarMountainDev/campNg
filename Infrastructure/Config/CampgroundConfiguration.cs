using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class CampgroundConfiguration : IEntityTypeConfiguration<Campground>
{
    public void Configure(EntityTypeBuilder<Campground> builder)
    {
        builder.Property(x => x.Name).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(180).IsRequired();
    }
}