using Core.Entities;

namespace Core.Specifications;

public class CampsiteTypeSpecification : BaseSpecification<CampsiteType>
{
    public CampsiteTypeSpecification(BaseSpecParams specParams) : base(null)
    {
        ApplyPaging(specParams.PageSize * (specParams.PageNumber - 1), specParams.PageSize);
    }
}