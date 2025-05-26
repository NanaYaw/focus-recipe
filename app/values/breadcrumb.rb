class Breadcrumb
  def self.call(name, path)
    @name = name
    @path = path
  end

  def link?
    @path.present?
  end

  private
  attr_reader :name, :path
end